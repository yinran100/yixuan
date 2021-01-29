import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

export default function ReactHooks (props) {
  const user = useSelector(state => state.user)
  return <div>{ JSON.stringify(user.userInfo, null, 2) }</div>
}
