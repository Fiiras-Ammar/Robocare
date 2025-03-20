import {
    NOTE_SUCCESS,
    NOTE_FAIL,
    NOTE_NAMES_SUCCESS,
    NOTE_NAMES_FAIL,
    SET_NOTE_NAME_SUCCESS,
    SET_NOTE_NAME_FAIL,

} from '../utils/types';

const initialState = {
    has_note: false,
    note_data: [],
    fileNames: null,
    currentSheetName: null,
};

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case NOTE_SUCCESS:
            return {
                ...state,
                has_note: true,
                note_data: payload
            }
        case NOTE_FAIL:
            return {
                ...state,
                has_note: false,
                note_data: null
            }
        case NOTE_NAMES_SUCCESS:
            return {
                ...state,
                fileNames: payload
            }
        case NOTE_NAMES_FAIL:
            return {
                ...state,
                fileNames: null
            }
        case SET_NOTE_NAME_SUCCESS:
            return {
                ...state,
                currentSheetName: payload
            }
        case SET_NOTE_NAME_FAIL:
            return {
                ...state,
                currentSheetName: null
            }
        default:
            return {
                ...state
            }
    }

}