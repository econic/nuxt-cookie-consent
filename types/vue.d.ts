import { CookieConsent } from "./index";

// augment typings of Vue.js
import "./vue";

declare module "vue/types/vue" {
	interface Vue {
		$cookieConsent: CookieConsent;
	}
}

declare module 'vuex/types/index' {
	interface Store<S> {
		$cookieConsent: CookieConsent
	}
}
