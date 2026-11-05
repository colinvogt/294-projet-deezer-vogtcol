import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    notification: { visible: false, message: '', color: 'primary', id: 0 },
  }),
  actions: {
    notify (message, color = 'primary') {
      // Une nouvelle clé relance les deux secondes, même pour deux actions rapides.
      this.notification = { visible: true, message, color, id: this.notification.id + 1 }
    },
  },
})
