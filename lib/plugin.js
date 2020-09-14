import Vue from 'vue'
import makeCookieUniversal from 'cookie-universal'

export default ({req, res}, inject) => {

	const CookieUniversal = makeCookieUniversal(req, res)

	let cookieConsentObject = {
		_showConsentOptions: false,
		get showConsentOptions() {
			return this._showConsentOptions
		},
		set showConsentOptions(show) {
			this._showConsentOptions = show
		},
		hasUserMadeChoice: false,
		openConsentOptions() {
			this.showConfigurationOptions = true
		},
		closeConsentOptions() {
			this.showConfigurationOptions = false
		},
		get(name, options) {
			return CookieUniversal.get(name, options)
		},
		set(name, value, options) {
			return CookieUniversal.get(name, value, options)
		},
	}

	const options = <%= serialize(options) %>

	Object.assign(cookieConsentObject, options)

	// make observable
	cookieConsentObject = Vue.observable(cookieConsentObject)

	inject('cookieConsent', cookieConsentObject)

}
