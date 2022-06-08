// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'semantic-ui-css/semantic.min.css'
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { v4 as uuid } from 'uuid';

export const USER: string = uuid();
console.log(USER);

ReactDOM.render(<App />, document.getElementById('root'));
