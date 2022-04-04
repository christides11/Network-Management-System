import React from 'react'
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as FiIcons from 'react-icons/fi';

export const SidebarData = [
    {
        title: 'Home',
        path: '/summary',
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
        title: 'Alerts',
        path: '/alerts',
        icon: <FiIcons.FiAlertTriangle />,
        cName: 'navText'
    },
    {
        title: 'Create Discovery Job',
        path: '/discovery',
        icon: <FiIcons.FiAlertTriangle />,
        cName: 'navText'
    },
    {
        title: 'View Discovery Jobs',
        path: '/discoveryjobs',
        icon: <FiIcons.FiAlertTriangle />,
        cName: 'navText'
    },
    {
        title: 'Discovery Log',
        path: '/discoverylog',
        icon: <FiIcons.FiAlertTriangle />,
        cName: 'navText'
    },
]