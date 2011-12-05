/*******************************************************************************
 * Copyright (c) 2011 EclipseSource and others. All rights reserved.
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   EclipseSource - initial API and implementation
 ******************************************************************************/
 
qx.Class.define( "org.eclipse.swt.widgets.CoolBar", {
  extend : qx.ui.layout.CanvasLayout,

  construct : function() {
    this.base( arguments );
    this._locked = false;
  },
  
  
  members : {
    
    setLocked : function( value ) {
      this._locked = value;
      var children = this.getChildren();
      var CoolItem = org.eclipse.swt.widgets.CoolItem;
      for( var i = 0; i < children.length; i++ ) {
        if( children[ i ] instanceof CoolItem ) {
          children[ i ].setLocked( value );
        }
      }
    },
    
    getLocked : function() {
      return this._locked;
    }
    
  }

} );