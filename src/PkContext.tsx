import React from 'react';
import {Proskomma} from 'proskomma';

const PkContext = React.createContext(new Proskomma());
export const PkProvider = PkContext.Provider;
export default PkContext;
