import React from 'react'
import ReactDOM from 'react-dom'
import {
    BrowserRouter,
    Routes,
    Route
} from 'react-router-dom'
import Menu from './components/Menu'
import InputForm from './components/InputForm'
import InfoPanel from './components/InfoPanel'
import Home from './components/Home'
import About from './components/About'
import Download from './components/Download'
import Contact from './components/Contact'
import Gene from './components/Gene'
import Network from './components/Network'

ReactDOM.render(
    <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Menu />
            <div style={{ flex: 1, height: '100%', padding: '10px', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-start' }}>
                <InputForm />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/download" element={<Download />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/gene/:query" element={<Gene />} />
                    <Route path="/network/:gwas/:mlogp/:exactTrait" element={<Network />} />
                    <Route path="/network/:query" element={<Network />} />
                </Routes>
            </div>
        </div>
    </BrowserRouter>,
    document.getElementById('reactEntry')
)
