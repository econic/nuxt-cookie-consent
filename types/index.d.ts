// augment typings of Vue.js
import "./vue";
import { NuxtCookies } from 'cookie-universal-nuxt'

type Consent = true|false|undefined

export interface ConsentStatus {
	[key: string]: Consent
}

export interface ConsentUpdateData {
	consentStatus: Consent
	previousConsentStatus: Consent
}

export interface CookieConsent {
	hasUserMadeChoice: boolean,
	readonly consentStatus: ConsentStatus,
	updateCookieProperties: () => void
	showConsentOptions: boolean,
	readonly hasUserAcceptedAllGroups: boolean
	readonly isConsentComplete: boolean
	readonly config: any
	acceptGroup: (groupId: string) => void
	declineGroup: (groupId: string) => void
	acceptAll: () => void
	declineAll: () => void
	clearAllData: () => void
	getGroupIdByCookieName: (cookieName: string) => string
	registerGroupHandler: (groupId: string, handlerId: string, handler: (consentUpdateData: ConsentUpdateData) => any) => void

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
