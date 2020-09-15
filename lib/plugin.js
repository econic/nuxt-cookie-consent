import Vue from 'vue'
import makeCookieUniversal from 'cookie-universal'

export default ({req, res}, inject) => {

	// todo handle expirationDate

	// noinspection JSAnnotator
	const options = <%= serialize(options) %>

	const cookieNames = {
		consentStatusByGroupName: 'cookie_consent_status',
	}

	const CookieUniversal = makeCookieUniversal(req, res)

	let cookieConsentObject = {

		// properties derived from cookie values
		hasUserMadeChoice: null,
		consentStatus: null,
		updateCookieProperties() {
			this.hasUserMadeChoice = !!CookieUniversal.get(cookieNames.consentStatusByGroupName)
			this.consentStatus = CookieUniversal.get(cookieNames.consentStatusByGroupName) || {}
		},

		// data properties
		showConsentOptions: false,

		// getters
		get hasUserAcceptedAllGroups() {
			return Object.keys(this.config.groups).every(groupId => !!this.consentStatus[groupId])
		},
		get isConsentComplete() {
			return Object.keys(this.config.groups).every(groupId => groupId in this.consentStatus)
		},
		get config() {
			return options
		},

		// functions
		init() {
			// read data from cookies
			this.updateCookieProperties()

			// call all onAccept handlers
			Object.keys(this.consentStatus)
				.filter(groupId => this.config.groups[groupId] && this.config.groups[groupId].onInit)
				.forEach(groupId => this.config.groups[groupId].onInit(this.consentStatus[groupId]))
		},
		acceptGroup(groupId) {
			this._assertGroupExists(groupId)
			if (this.consentStatus[groupId] === true) {
				return
			}
			CookieUniversal.set(
				cookieNames.consentStatusByGroupName,
				{
					...this.consentStatus,
					[groupId]: true,
				}
			)
			this.updateCookieProperties()
			this.config.groups[groupId].onAccept && this.config.groups[groupId].onAccept(true)
		},
		declineGroup(groupId) {
			this._assertGroupExists(groupId)
			if (this.consentStatus[groupId] === false) {
				return
			}
			CookieUniversal.set(
				cookieNames.consentStatusByGroupName,
				{
					...this.consentStatus,
					[groupId]: false,
				}
			)
			this.updateCookieProperties()
			this.config.groups[groupId].onDecline && this.config.groups[groupId].onDecline(true)
		},
		acceptAll() {
			Object.keys(this.config.groups).forEach(groupId => this.acceptGroup(groupId))
		},
		declineAll() {
			Object.keys(this.config.groups).forEach(groupId => this.declineGroup(groupId))
		},
		clearAllData() {
			CookieUniversal.remove(cookieNames.consentStatusByGroupName)
			this.updateCookieProperties()
		},
		getGroupIdByCookieName(cookieName) {
			return Object.keys(this.config.groups).find(groupId => this.config.groups[groupId].cookies.includes(cookieName))
		},

		// decorator for cookie-universal
		get(cookieName, options) {
			return CookieUniversal.get(cookieName, options)
		},
		set(cookieName, value, options) {
			if (!this.consentStatus[this.getGroupIdByCookieName(cookieName)]) {
				throw new Error(`Cookie ${cookieName} has not been given consent`)
			}
			return CookieUniversal.get(cookieName, value, options)
		},
		_assertGroupExists(groupId) {
			if (!(groupId in this.config.groups)) {
				throw new Error(`group ${groupId} is not configured`)
			}
		}

	}

	// read cookies
	cookieConsentObject.init()

	// make observable
	cookieConsentObject = Vue.observable(cookieConsentObject)

	inject('cookieConsent', cookieConsentObject)

}
