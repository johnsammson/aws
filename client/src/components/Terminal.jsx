import {Terminal as XTerminal} from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import React, { useEffect, useRef } from 'react'
import socket from '../socket'

export default function Terminal() { 
    const terminalRef = useRef()
    const isRendered = useRef(false)
    useEffect(()=>{
        if(isRendered.current) return
        isRendered.current = true
        socket.emit('terminal:write', '\n')
        const term = new XTerminal({
            rows:20
        })
        term.open(terminalRef.current)

        //send the terminal data to the server
        term.onData((data)=>{
            socket.emit('terminal:write', data)
        })
        //display the data from the server in the terminal
        socket.on('terminal:data', (data)=>{
            term.write(data)
        })

        // return () => {
        //     term.dispose(); // Clean up terminal instance
        //     socket.off('terminal:data', (data)=>{
        //         term.write(data)
        //     }); // Remove event listener for socket data
        // };
    },[])
  return (
    <div ref={terminalRef} id="terminal" style={{height:"20vh"}}>

    </div>
  )
}
