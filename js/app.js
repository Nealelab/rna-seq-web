import React from 'react'
import ReactDOM from 'react-dom'
import {
    BrowserRouter,
    Route,
    Switch,
    withRouter
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

const FormWithRouter = withRouter(InputForm)

ReactDOM.render(
    <BrowserRouter>
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
    <Menu />
    <div style={{flex: 1, height: '100%', padding: '10px', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-start'}}>
    <FormWithRouter />
    <Route exact path='/' component={Home}/>
    <Route path='/about' component={About}/>
    <Route path='/download' component={Download}/>
    <Route path='/contact' component={Contact}/>
    <Route path='/gene/:query' component={Gene}/>
    <Switch>
    <Route path='/network/:gwas/:mlogp/:exactTrait' component={Network}/>
    <Route path='/network/:query' component={Network}/>
    </Switch>
    </div>
    </div>
    </BrowserRouter>
    , document.getElementById('reactEntry'))
