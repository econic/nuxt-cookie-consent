import Vue from 'vue'
import makeCookieUniversal from 'cookie-universal'

export default ({req, res}, inject) => {

	// noinspection JSAnnotator
	const options = <%= serialize(options) %>

	const consentCookieConfig = {
		name: options.consentCookie.name,
		maxAge: options.consentCookie.maxAge,
	}

	const CookieUniversal = makeCookieUniversal(req, res)

	let cookieConsentObject = {

		// properties derived from cookie values
		hasUserMadeChoice: null,
		consentStatus: null,
		updateCookieProperties() {
			this.consentStatus = CookieUniversal.get(consentCookieConfig.name) || {}
			this.hasUserMadeChoice = !!CookieUniversal.get(consentCookieConfig.name)
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
		_groupHandlers: Object.keys(options.groups)
			.reduce((previous, current) => ({...previous, [current]: {}}), {}),

		// functions
		acceptGroup(groupId) {
			this._assertGroupExists(groupId)
			if (this.consentStatus[groupId] === true) {
				return
			}
			const previousConsentStatus = {...this.consentStatus}

			// update the cookie
			CookieUniversal.set(
				consentCookieConfig.name,
				{
					...this.consentStatus,
					[groupId]: true,
				},
				{
					maxAge: consentCookieConfig.maxAge,
				}
			)
			this.updateCookieProperties()

			// call handlers
			this._callGroupHandlers(groupId, {
				consentStatus: this.consentStatus[groupId],
				previousConsentStatus: previousConsentStatus[groupId],
			})
		},
		declineGroup(groupId) {
			this._assertGroupExists(groupId)
			if (this.consentStatus[groupId] === false) {
				return
			}

			const previousConsentStatus = {...this.consentStatus}
			CookieUniversal.set(
				consentCookieConfig.name,
				{
					...this.consentStatus,
					[groupId]: false,
				},
				{
					maxAge: consentCookieConfig.maxAge,
				}
			)
			this.updateCookieProperties()

			// call handlers
			this._callGroupHandlers(groupId, {
				consentStatus: this.consentStatus[groupId],
				previousConsentStatus: previousConsentStatus[groupId],
			})
		},
		acceptAll() {
			Object.keys(this.config.groups).forEach(groupId => this.acceptGroup(groupId))
		},
		declineAll() {
			Object.keys(this.config.groups).forEach(groupId => this.declineGroup(groupId))
		},
		clearAllData() {
			const previousConsentStatus = {...this.consentStatus}

			// delete cookies
			CookieUniversal.remove(
				consentCookieConfig.name,
				{
					maxAge: consentCookieConfig.maxAge,
				}
			)
			this.updateCookieProperties()

			// call handlers
			Object.keys(this._groupHandlers).forEach(groupId => {
				if (this.consentStatus[groupId] === previousConsentStatus[groupId]) {
					return
				}

				// call handler
				this._callGroupHandlers(groupId, {
					consentStatus: undefined,
					previousConsentStatus: previousConsentStatus[groupId],
				})
			})
		},
		getGroupIdByCookieName(cookieName) {
			return Object.keys(this.config.groups).find(groupId => this.config.groups[groupId].cookies.includes(cookieName))
		},
		registerGroupHandler(groupId, handlerId, handler) {
			this._assertGroupExists(groupId)

			// call handler
			handler({
				consentStatus: this.consentStatus[groupId],
				previousConsentStatus: this.consentStatus[groupId],
			})

			// register handler
			this._groupHandlers[groupId][handlerId] = handler
		},
		unregisterGroupHandler(groupId, handlerId) {
			delete this._groupHandlers[groupId][handlerId]
		},
		_callGroupHandlers(groupId, data) {
			Object.values(this._groupHandlers[groupId]).forEach( handler => handler(data) )
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
	cookieConsentObject.updateCookieProperties()

	// make observable
	cookieConsentObject = Vue.observable(cookieConsentObject)

	inject('cookieConsent', cookieConsentObject)

}
