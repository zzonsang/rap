
/*******************************************************************************
 * Copyright (c) 2002-2006 Innoopract Informationssysteme GmbH.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 * 
 * Contributors:
 *     Innoopract Informationssysteme GmbH - initial API and implementation
 ******************************************************************************/

qx.Class.define( "org.eclipse.swt.Application", {
  extend : qx.application.Gui,

  construct : function() {
    this.base( arguments );
  },

  statics : {
    // TODO [rh] causes JavaScript error
    //  var doc = qx.ui.core.ClientDocument.getInstance();
    //  doc.removeEventListener( "windowresize", this._onResize );
    _onResize : function( evt ) {
      var doc = qx.ui.core.ClientDocument.getInstance();
      var req = org.eclipse.swt.Request.getInstance();
      var id = req.getUIRootId();

      // TODO [rh] replace code below with qx.dom.Window.getInnerWidth( window )
      //      and getInnerHeight( window ) when available. Seems like qx 0.6 does
      //      not yet support these functions.
      var width = 0;
      var height = 0;
      if( document.layers || ( document.getElementById && !document.all ) ) {
        width = window.innerWidth;
        height = window.innerHeight;
      } else if( document.all ) {
        width = document.body.clientWidth;
        height = document.body.clientHeight;
      }
      // Append document size to request
      req.addParameter( id + ".bounds.width", String( width ) );
      req.addParameter( id + ".bounds.height", String( height ) );
      req.send();
    }
  },

  members : {
    main : function( evt ) {
      this.base( arguments );
      
      var aliasMgr = qx.manager.object.AliasManager.getInstance();
      // Overwrite the default mapping for internal images. This is necessary
      // if the application is deployed under a root different from "/".
      aliasMgr.add( "static", "./resource/static" );
      aliasMgr.add( "org.eclipse.swt", "./resource" );
      
      // Set the one and only theme
      var theme = org.eclipse.swt.theme.Default;
      qx.manager.object.ThemeManager.getInstance().setTheme( theme );

      // Note: currently the theme (org.eclipse.swt.theme.Default) is set in 
      //       the qooxdoo build,
      
      // Observe window size
      var doc = qx.ui.core.ClientDocument.getInstance();
      doc.addEventListener( "windowresize", 
                            org.eclipse.swt.Application._onResize );
      // Initial request to obtain startup-shell
      var req = org.eclipse.swt.Request.getInstance();
      org.eclipse.swt.Application._onResize();  // appends bounds to the request
      req.send();
    },

    close : function( evt ) {
      this.base( arguments );
      // If a non-null (?) value is returned, the user is prompted when leaving the page.
      // TODO [rst] Make return value configurable
      // return "If you leave this page, your current session data will be lost.";
    },
    
    terminate : function( evt ) {
      this.base( arguments );
    }
  }
});
