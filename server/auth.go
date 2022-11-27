package main

import (
	"context"
	"fmt"
	"log"
	"github.com/boourns/minilog/cfg"
	"github.com/boourns/minilog/lib"
	"github.com/go-chi/chi"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/github"
	"net/http"
)

var cookieStore *sessions.CookieStore

func initAuth(router chi.Router, githubKey string, githubSecret string) {
	maxAge := 86400 * 1 // 30 days
	isProd := false     // Set to true when serving over https

	cookieStore = sessions.NewCookieStore([]byte(cfg.Config.CookieSecret))
	cookieStore.MaxAge(maxAge)
	cookieStore.Options.Path = "/"
	cookieStore.Options.HttpOnly = true   // HttpOnly should always be enabled
	cookieStore.Options.Secure = isProd

	gothic.Store = cookieStore

	goth.UseProviders(
		github.New(githubKey, githubSecret, "http://localhost:1112/auth/callback?provider=github"),
	)

	router.Get("/auth/callback", func(res http.ResponseWriter, req *http.Request) {
		user, err := gothic.CompleteUserAuth(res, req)
		if err != nil {
			fmt.Fprintln(res, err)
			return
		}
		setAuthCookie(res, req, user)
		http.Redirect(res, req, "/admin", http.StatusTemporaryRedirect)
	})

	router.Get("/logout", func(res http.ResponseWriter, req *http.Request) {
		gothic.Logout(res, req)

		http.Redirect(res, req, "/", http.StatusTemporaryRedirect)
	})

	router.Get("/auth", func(res http.ResponseWriter, req *http.Request) {
		// try to get the user without re-authenticating
		if user, err := gothic.CompleteUserAuth(res, req); err == nil {
			setAuthCookie(res, req, user)

			http.Redirect(res, req, "/admin", http.StatusTemporaryRedirect)
		} else {
			gothic.BeginAuthHandler(res, req)
		}
	})
}

func Protect(redirect bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			session, err := cookieStore.Get(r, "minilog-admin")
			if err != nil {
				lib.Error(w, "User not authorized", 401)
			}

			var username interface{}
			var ok bool
			if username, ok = session.Values["githubUser"]; !ok {
				if redirect {
					http.Redirect(w, r, "/auth?provider=github", http.StatusTemporaryRedirect)
				} else {
					lib.Error(w, "Unauthorized", 401)
				}
				return
			}

			userAllowed := false
			for _, allowed := range cfg.Config.AllowedUsers {
				if allowed == username.(string) {
					userAllowed = true
				}
			}

			if userAllowed {
				r = r.WithContext(context.WithValue(r.Context(), "username", username.(string)))
				next.ServeHTTP(w, r)
			} else {
				lib.Error(w, "User not authorized", 401)
				return
			}
		})
	}
}

func setAuthCookie(w http.ResponseWriter, r *http.Request, user goth.User) error {
	session, err := cookieStore.Get(r, "minilog-admin")
	if err != nil {
		return err
	}

	session.Values["githubUser"] = user.NickName
	session.Save(r, w)

	return nil
}