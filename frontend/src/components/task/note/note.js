import React, { useEffect, useRef, useState } from "react";
import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable/base';
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';
import { useDispatch, useSelector } from "react-redux";
import { get_note, save_note } from "../../../actions/note";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";
import { NOTE_FAIL, NOTE_SUCCESS } from "../../../utils/types";
import { ImUndo2 } from "react-icons/im";
import { ImRedo2 } from "react-icons/im";
import { FaListCheck } from "react-icons/fa6";
import { loadingBegin, loadingEnd } from "../../../actions/map";
import { showSnackbar } from "../../../actions/snackbar";

registerAllModules();

const Note = ({ id_task, close }) => {

    const dispatch = useDispatch()
    const noteRef = useRef(null);
    const name = useSelector(state => state.noteReducer.currentSheetName)
    const [data, setdata] = useState(null)
    const [LocalName, setLocalName] = useState(null)
    useEffect(() => {
        if (!name) return
        setLocalName(name)
        dispatch(get_note(id_task, name)).then((res) => {
            if (res.status === 200) {
                setdata(res.data.data["datasheet"])
            } else {
            }
        })
    }, [name])

    const onBeforeHotChange = changes => {
        dispatch({
            type: NOTE_SUCCESS,
            payload: null
        });
    }
    const saveNote = () => {
        const noteInstance = noteRef.current.hotInstance
        const notedata = noteInstance.getData()
        dispatch(save_note(id_task, notedata, LocalName)).then((res) => {
            if (res.status === 200) {
                dispatch(showSnackbar("success", undefined, res.data.message, "top", "right"))
            } else {

            }
        })
    }

    const undoEvent = () => {
        const noteInstance = noteRef.current.hotInstance
        noteInstance.undo()
    }
    const redoEvent = () => {
        const noteInstance = noteRef.current.hotInstance
        noteInstance.redo()
    }

    return (
        <div className="container-fluid mt-3">
            <div className="row">
                <div className="col-md-12">
                    <HotTable
                        ref={noteRef}
                        rowHeaders={true}
                        colHeaders={true}
                        contextMenu={true}
                        manualColumnResize={true}
                        manualRowMove={true}
                        manualRowResize={true}
                        mergeCells={true}
                        filters={true}
                        dropdownMenu={true}
                        beforeChange={onBeforeHotChange}
                        data={data}
                        stretchH="all"
                        height="75vh"
                        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
                    />
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-md-6 d-flex justify-content-between">
                    <Button variant="outline-primary" onClick={undoEvent}><ImUndo2 /> Undo</Button>
                    <Button variant="outline-primary" onClick={redoEvent}><ImRedo2 /> Redo</Button>
                    <Button variant="outline-success" onClick={saveNote}><FaListCheck /> Save</Button>
                    <Button variant="light" onClick={close}> Cancel</Button>
                </div>
            </div>
        </div>
    )
}
export default Note