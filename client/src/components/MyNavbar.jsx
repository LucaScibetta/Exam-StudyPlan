import '../App.css';
import { Container, Navbar, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { NavLink } from 'react-router-dom';

function MyNavbar(props) {
    return (
        <>
            <Navbar bg='secondary'>
                <Container fluid>
                    <NavLink to={props.loggedIn ? '/profile' : '/'} className={({ isActive }) => isActive ? 'btn btn-light text-secondary text-decoration-none' : 'btn btn-secondary text-light text-decoration-none'}>
                        <i className="bi bi-mortarboard-fill"></i>
                        &nbsp;My study plan!
                    </NavLink>
                    {props.loggedIn ? <Button variant='secondary' className='text-decoration-none' onClick={props.logout}>Logout</Button>:
                    <NavLink to='login' className={({ isActive }) => isActive ? 'btn btn-light text-secondary text-decoration-none' : 'btn btn-secondary text-light text-decoration-none'}>
                        Login
                    </NavLink>}
                </Container>
            </Navbar>
        </>
    )
}

export default MyNavbar;