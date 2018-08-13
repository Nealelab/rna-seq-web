import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'

class Menu extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div style={{flex: '0 1 auto', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-start', backgroundColor: '#000000', padding: '30px'}}>
            <div className='menuitem'><Link to='/'>TOOL</Link></div>
            <div className='menuitem'><Link to='/about'>ABOUT</Link></div>
            <div className='menuitem'><Link to='/download'>DOWNLOAD</Link></div>
            <div className='menuitem'><Link to='/contact'>CONTACT</Link></div>
            </div>
        )
    }
}

export default Menu
