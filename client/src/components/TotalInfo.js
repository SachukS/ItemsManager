import React, {useContext, useEffect, useState} from "react";
import {countServiceNumbers} from "../utils/counters";
import {StoreContext} from "../store/store";
import refreshGif from "../images/icons8-refresh.gif"
import {observer} from "mobx-react";
import {SERVICES} from "../generated_constants";

function Loader() {
    return <img src={refreshGif} alt=".." style={{height: '20px'}}/>
}

function TotalInfo() {

    const store = useContext(StoreContext)
    const {items, pending} = store
    const [counters, setCounters] = useState({})

    useEffect(() => {
        let _counters = countServiceNumbers(items)
        console.log(_counters)
        setCounters(_counters)
    }, [items, items.length]);

    return (
        <div className={"search-handlers"}>
            <div className={"info-total"}>
                Всього: {pending ? <Loader/> : items.length}
            </div>
            {Object.keys(SERVICES).map((key) => {
                return <div key={key}
                            className={`info-${SERVICES[key].icon}`}>&#10687; - {SERVICES[key].name}: {pending ?
                    <Loader/> : counters[key]}</div>
            })}
        </div>
    )
}

export default observer(TotalInfo)