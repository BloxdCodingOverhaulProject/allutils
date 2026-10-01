// Timekeeper for a standardized time variable
// Written by fenl, 2026

import cb from './callbackManager.js'
let time = 0
new cb('tick', () => time++)
export default time
