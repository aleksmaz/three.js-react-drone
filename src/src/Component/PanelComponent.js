import React from 'react'
import s from './PanelComponent.module.css'

const  PanelComponent = () => {



    return (


<div className={s.panel}>
    <div className={s.pos}>
    <div className={s.fixed} id="posX" >Position X</div>
    <div className={s.fixed} id="posZ" >Position Z</div>
     <div className={s.intext}>Position Y <input className={s.n} type="number"   /></div>
    </div>
    <button className={s.pressedButton}>Create Path</button>

</div>

    )
}


export default PanelComponent