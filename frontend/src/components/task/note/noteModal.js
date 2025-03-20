import React from "react";
import Note from "./note";
import Row from "react-bootstrap/esm/Row";
import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { unSetSheetName } from "../../../actions/note";

const NoteModal = ({ open, handleClose, idTask }) => {
    const name = useSelector(state => state.noteReducer.currentSheetName)
    const [Name, setName] = useState(null)
    const dispatch = useDispatch();
    useEffect(() => {
        return () => {
            dispatch(unSetSheetName())
        }
    })
    useEffect(() => {
        if (!name) return
        setName(name)
    }, [name])
    return (
        <Modal show={open} onHide={handleClose} fullscreen={true} centered>
            <Modal.Header closeButton style={{
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
            }}>
                <Modal.Title>Edit your {Name} Spreadsheet !</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Note id_task={idTask} close={handleClose} />
            </Modal.Body>

        </Modal>




    )
}
export default NoteModal