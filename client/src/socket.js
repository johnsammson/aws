import {io} from 'socket.io-client'
import { backendurl } from './utils/urls'

const socket = io(backendurl)

export default socket