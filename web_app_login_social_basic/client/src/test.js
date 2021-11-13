import React, {useState} from 'react';

export const ThemeContext = React.createContext();



export default function test(){
    const [darkTheme, setDarkTheme] = useState(true);

    function toggleTheme () {
        setDarkTheme(prevDarkTheme => !prevDarkTheme)
    }


    return(
        <div>
            <h1>Hi Test</h1>
            <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
    );
}
