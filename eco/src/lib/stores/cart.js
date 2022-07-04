import { writable} from "svelte/store";

export const products = writable([
	])
export const cart = writable([])
export const address = writable({
		name: "",
		email: "",
		phone: "",
		street: "",
		city: "",
		teur: "",
	})