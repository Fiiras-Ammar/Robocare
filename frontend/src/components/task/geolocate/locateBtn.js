import React, { useEffect, useState } from "react";
import { IoAddSharp,
    IoLocateOutline,
    IoLocateSharp,
    IoLocate,
    IoLocationOutline,
    IoLocationSharp,
    IoLocation} from "react-icons/io5";
import '../../../assets/css/locateBtn.css'
import { setClickEventFail, setClickEventSucess } from "../../../actions/map";
import { useDispatch } from "react-redux";

const LocateBtn = ({getlocation}) => {

    const [btnref, setbtnref] = useState(null)
    const dispatch = useDispatch()
    useEffect(() => {
        if (!btnref) return
        btnref.addEventListener('mouseenter', disableMapInteractions);
        btnref.addEventListener('mouseleave', enableMapInteractions);
        // btnref.addEventListener('click')
    }, [btnref])

    const disableMapInteractions = () => {
        dispatch(setClickEventFail())
    };
    const enableMapInteractions = () => {
        dispatch(setClickEventSucess())
    };

    return (
        <button className="Btn-locate" ref={setbtnref} onClick={getlocation}>

            <div className="sign-note">
                <IoLocateOutline style={{ fontSize: "25px", color: "#fff" }} />
            </div>

            <div className="text-note">Track my location</div>
        </button>
    )
}
export default LocateBtn;