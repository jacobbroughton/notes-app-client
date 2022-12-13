import { createSlice } from "@reduxjs/toolkit"

const modalsSlice = createSlice({
  name: "modals",
  initialState: {
    unsavedWarningVisible: false,
    deleteModalVisible: false
  },
  reducers: {
    toggleModal: (state, { payload }) => {
      return {
        ...state,
        [`${payload}Visible`]: !state[`${payload}Visible`]
      }
    }
  }
})

export default modalsSlice.reducer
export const { toggleModal } = modalsSlice.actions