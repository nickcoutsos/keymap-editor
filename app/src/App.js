import '@fortawesome/fontawesome-free/css/all.css'
import keyBy from 'lodash/keyBy'
import { useEffect, useState } from 'react';
import './App.css';
import Key from './Keys/Key'
import KeyParamlist from './Keys/KeyParamlist'
import KeyValue from './Keys/KeyValue'
import { DefinitionsContext } from './providers'
import { loadKeycodes } from './keycodes'
import { loadBehaviours } from './api'
import KeyboardPicker from './Pickers/KeyboardPicker';

function App() {
  const position = { x: 1, y: 1 }
  const rotation = { r: 0, rx: 0, ry: 0 }
  const size = { u: 1, h: 1 }
  const value = '&kp'
  const params = [
    { value: 'N1' }
  ]

  const [definitions, setDefinitions] = useState(null)
  
  useEffect(() => {
    Promise.all([
      loadKeycodes(),
      loadBehaviours()
    ]).then(([keycodes, behaviours]) => {
      keycodes.indexed = keyBy(keycodes, 'code')
      behaviours.indexed = keyBy(behaviours, 'code')

      setDefinitions({ keycodes, behaviours })
    })
  }, [])

  return (
    <div className="App">
      <KeyboardPicker />
      <header className="App-header">
        {definitions && <DefinitionsContext.Provider value={definitions}>
          <KeyValue source={{ code: 'foo' }} />
          <KeyParamlist
            index={[]}
            params={['code']}
            values={[
              {
                value: 'N1',
                source: { code: 'N1', symbol: '1' },
                params: []
              }
            ]}
          />
          <Key
            position={position}
            rotation={rotation}
            size={size}
            value={value}
            params={params}
          />
          <Key
            position={{ x: 2, y: 1 }}
            rotation={rotation}
            size={size}
            value={'&kp'}
            params={[{
              value: 'C_VOL_UP',
              source: definitions.keycodes.indexed.C_VOL_UP
            }]}
          />
        </DefinitionsContext.Provider>}
      </header>
    </div>
  );
}

export default App;
