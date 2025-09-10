import React from 'react'

interface HelloWorldProps {
  msg: string
}

const HelloWorld: React.FC<HelloWorldProps> = ({ msg }) => {
  return (
    <div className="greetings">
      <h1 className="green text-4xl font-medium relative -top-3">{msg}</h1>
      <h3 className="text-xl">
        You've successfully created a project with{' '}
        <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> +{' '}
        <a href="https://reactjs.org/" target="_blank" rel="noopener">React</a>. What's next?
      </h3>
    </div>
  )
}

export default HelloWorld