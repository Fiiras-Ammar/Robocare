import React, { useEffect, useState } from "react";
import { IoAddSharp } from "react-icons/io5";
import '../../../assets/css/noteBtn.css'
import { setClickEventFail, setClickEventSucess } from "../../../actions/map";
import { useDispatch } from "react-redux";

const NoteBtn = ({ openModal }) => {

    const [btnref, setbtnref] = useState(null)
    const dispatch = useDispatch()
    useEffect(() => {
        if (!btnref) return
        btnref.addEventListener('mouseenter', disableMapInteractions);
        btnref.addEventListener('mouseleave', enableMapInteractions);
    }, [btnref])

    const disableMapInteractions = () => {
        dispatch(setClickEventFail())
    };
    const enableMapInteractions = () => {
        dispatch(setClickEventSucess())
    };

    return (
        <button className="Btn-note" ref={setbtnref} onClick={openModal}>

            <div className="sign-note">
                <IoAddSharp style={{ fontSize: "25px", color: "#fff" }} />
            </div>

            <div className="text-note">Technical Files</div>
        </button>
    )
}
export default NoteBtn