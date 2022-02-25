import React, {useState} from 'react'
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import {Link} from 'react-router-dom';
import {SidebarData} from "./SidebarData";
import {IconContext} from 'react-icons';
import "./Navbar.css";

export default function Navbar() {
    const[sideBar, setSideBar] = useState(false)
    const showSideBar = () => setSideBar(!sideBar)
    return (
        <>
        <IconContext.Provider value={{color: "#fff"}}>
            <div className="navbar">
                <Link to="#" className="menuBars">
                    <FaIcons.FaBars onClick={showSideBar} />
                </Link>
            </div>
            <nav className={sideBar ? 'navMenu active' : 'navMenu' } >
                <ul className="navMenuItems" onClick={showSideBar}>
                    <li className="navBarToggle">
                        <Link to="#" className="menuBars">
                            <AiIcons.AiOutlineClose />
                        </Link>
                    </li>
                    {SidebarData.map((item, index) => {
                        return(
                            <li key={index} className={item.cName}>
                                <Link to={item.path}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </IconContext.Provider>
        </>
    )
}