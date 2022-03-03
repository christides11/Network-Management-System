import React from 'react'
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as FiIcons from 'react-icons/fi';

export const SidebarData = [
    {
        title: 'Home',
        path: '/home',
        icon: <AiIcons.AiFillHome />,
        cName: 'navText'
    },
    {
        title: 'Devices',
        path: '/devices',
        icon: <FiIcons.FiMonitor />,
        cName: 'navText'
    },
    {
        title: 'Event Log',
        path: '/eventlog',
        icon: <BiIcons.BiNotepad />,
        cName: 'navText'
    },
    {
        title: 'Alerts',
        path: '/alerts',
        icon: <FiIcons.FiAlertTriangle />,
        cName: 'navText'
    },
    {
        title: 'Discovery',
        path: '/discovery',
        icon: <FiIcons.FiAlertTriangle />,
        cName: 'navText'
    },
]