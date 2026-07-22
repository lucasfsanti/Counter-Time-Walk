import { ref } from 'vue'

const editingTimerId = ref<number | null>(null)

export function useTimerNameEdit() {
  function startEditingName(timerId: number) {
    editingTimerId.value = timerId
  }

  function stopEditingName() {
    editingTimerId.value = null
  }

  return { editingTimerId, startEditingName, stopEditingName }
}

export function _resetTimerNameEditForTesting() {
  editingTimerId.value = null
}
