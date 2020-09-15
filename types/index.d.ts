// augment typings of Vue.js
import "./vue";
import { NuxtCookies } from 'cookie-universal-nuxt'

export interface ConsentStatus {
	[key: string]: true|false|undefined
}

export interface CookieConsent {
	hasUserMadeChoice: boolean,
	readonly consentStatus: ConsentStatus,
	updateCookieProperties: () => null
	showConsentOptions: boolean,
	readonly hasUserAcceptedAllGroups: boolean
	readonly isConsentComplete: boolean
	readonly config: any
	acceptGroup: (groupId: string) => null
	declineGroup: (groupId: string) => null
	acceptAll: () => null
	declineAll: () => null
	clearAllData: () => null
	getGroupIdByCookieName: (cookieName: string) => string

	// decorators
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
