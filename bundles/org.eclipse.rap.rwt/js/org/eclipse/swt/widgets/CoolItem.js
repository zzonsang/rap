/*******************************************************************************
 * Copyright (c) 2002, 2011 Innoopract Informationssysteme GmbH.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Innoopract Informationssysteme GmbH - initial API and implementation
 *     EclipseSource - ongoing development
 ******************************************************************************/
/**
 * The parameter orientation must be one of "vertical" or "horizontal".
 * Note that updateHandleBounds must be called after each size manipulation.
 */
qx.Class.define( "org.eclipse.swt.widgets.CoolItem", {
  extend : qx.ui.layout.CanvasLayout,

  construct : function( orientation ) {
    this.base( arguments );
    this.setOverflow( qx.constant.Style.OVERFLOW_HIDDEN );
    this.setAppearance( "coolitem" );
    this._orientation = orientation;
    // Create handle to drag this CoolItem around
    this._handle = new qx.ui.basic.Terminator();
    this._handle.addState( orientation );
    this._handle.setAppearance( "coolitem-handle" );
    //this._handle.setHeight( "100%" );
    this._handle.addEventListener( "mousedown", this._onHandleMouseDown, this );
    this._handle.addEventListener( "mousemove", this._onHandleMouseMove, this );
    this._handle.addEventListener( "mouseup", this._onHandleMouseUp, this );
    this.add( this._handle );
    // buffers zIndex and background during drag to be restored when dropped
    this._bufferedZIndex = null;
    this._bufferedControlZIndex = null;
    this._control = null;
  },

  destruct : function() {
    if( this._handle != null ) {
      this._handle.removeEventListener( "mousedown", this._onHandleMouseDown, this );
      this._handle.removeEventListener( "mousemove", this._onHandleMouseMove, this );
      this._handle.removeEventListener( "mouseup", this._onHandleMouseUp, this );
      this._handle.dispose();
    }
  },

  statics : {
    // TODO [rh] move to a central place, e.g. qx.constant.Style or similar
    DRAG_CURSOR : "col-resize",
    CONTROL_OFFSET : 6
  },

  members : {

    setLocked : function( value )  {
      this._handle.setDisplay( !value );
    },

    // reparenting to enable coolitem dragging
    setControl : function( control ) {
      if( control != null ) {
        // TODO [tb] : Control positioning is already handled by server
        control.setLeft(   this.getLeft()
                         + org.eclipse.swt.widgets.CoolItem.CONTROL_OFFSET );
        control.setDisplay( true );
      }
      if( this._control != null ) {
        this._control.setDisplay( false );
      }
      this._control = control;
    },

    updateHandleBounds : function() {
      if( this._orientation == "vertical" ) {
        this._handle.setWidth( this.getWidth() );
      } else {
        this._handle.setHeight( this.getHeight() );
      }
    },
    
    _applyParent : function( value, oldValue ) {
      this.base( arguments, value, oldValue );
      this.setLocked( value.getLocked() );
    },

    _onHandleMouseDown : function( evt ) {
      this._handle.setCapture( true );
      this.getTopLevelWidget().setGlobalCursor( org.eclipse.swt.widgets.CoolItem.DRAG_CURSOR );
      this._offsetX = evt.getPageX() - this.getLeft();
      this._offsetY = evt.getPageY() - this.getTop();
      this._bufferedZIndex = this.getZIndex();
      this.setZIndex( 1e7 - 1 );
      if( this._control != null ) {
        this._bufferedControlZIndex = this._control.getZIndex();
        this._control.setZIndex( 1e7 );
      }  
      // In some cases the coolItem appeare transparent when dragged around
      // To fix this, walk along the parent hierarchy and use the first explicitly
      // set background color.
      this.setBackgroundColor( this._findBackground() );
    },

    _applyLeft : function( newValue, oldValue ) {
      this.base( arguments, newValue, oldValue );
      if( this._control != null ) {
        var left = newValue + org.eclipse.swt.widgets.CoolItem.CONTROL_OFFSET; 
        this._control.setLeft( left );
      }
    },

    _applyWidth : function( newValue, oldValue ) {
      this.base( arguments, newValue, oldValue );
      if( this._control != null ) {
        var width = newValue - org.eclipse.swt.widgets.CoolItem.CONTROL_OFFSET;
        this._control.setWidth( width );
      }
    },

    _onHandleMouseMove : function( evt ) {
      if( this._handle.getCapture() ) {
        this.setLeft( evt.getPageX() - this._offsetX );
      }
    },

    _onHandleMouseUp : function( evt ) {
      this._handle.setCapture( false );
      this.setZIndex( this._bufferedZIndex );
      if( this._control != null ) {      
        this._control.setZIndex( this._bufferedControlZIndex );
      }
      this.resetBackgroundColor();
      this.getTopLevelWidget().setGlobalCursor( null );
      // Send request that informs about dragged CoolItem
      if( !org.eclipse.swt.EventUtil.getSuspended() ) {
        var widgetManager = org.eclipse.swt.WidgetManager.getInstance();
        var id = widgetManager.findIdByWidget( this );
        var req = org.eclipse.swt.Request.getInstance();
        req.addEvent( "org.eclipse.swt.events.widgetMoved", id );
        req.addParameter( id + ".bounds.x", this.getLeft() );
        req.addParameter( id + ".bounds.y", this.getTop() );
        req.send();
      }
    },

    _findBackground : function() {
      var hasParent = true;
      var result = null;
      var parent = this.getParent();
      while( hasParent && parent != null && result == null ) {
        if( parent.getBackgroundColor ) {
          result = parent.getBackgroundColor();
        }
        if( parent.getParent ) {
          parent = parent.getParent();
        } else {
          hasParent = false;
        }
      }
      return result;
    }
  }
});
