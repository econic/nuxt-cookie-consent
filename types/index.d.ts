// augment typings of Vue.js
import "./vue";
import { NuxtCookies } from 'cookie-universal-nuxt'

export interface CookieConsent {
	hasUserMadeChoice: boolean
	get:  NuxtCookies['get']
	set:  NuxtCookies['set']
}

declare module "@nuxt/vue-app" {
	interface NuxtAppOptions {
		$cookieConsent: CookieConsent
	}
}
// Nuxt 2.9+
declare module "@nuxt/types" {
	interface NuxtAppOptions {
		$cookieConsent: CookieConsent
	}
}
