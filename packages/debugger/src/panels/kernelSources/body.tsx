// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ReactWidget,
  showErrorMessage,
  ToolbarButtonComponent,
  UseSignal
} from '@jupyterlab/apputils';
import {
  ITranslator,
  nullTranslator,
  TranslationBundle
} from '@jupyterlab/translation';
import React from 'react';
import { openKernelSourceIcon } from '../../icons';
import { IDebugger } from '../../tokens';
import { KernelSourcesFilter } from './filter';

/**
 * The class name added to the filterbox node.
 */
const FILTERBOX_CLASS = 'jp-DebuggerKernelSource-filterBox';

/**
 * The class name added to hide the filterbox node.
 */
const FILTERBOX_HIDDEN_CLASS = 'jp-DebuggerKernelSource-filterBox-hidden';

/**
 * The body for a Sources Panel.
 */
export class KernelSourcesBody extends ReactWidget {
  /**
   * Instantiate a new Body for the KernelSourcesBody widget.
   *
   * @param options The instantiation options for a KernelSourcesBody.
   */
  constructor(options: KernelSourcesBody.IOptions) {
    super();
    this._model = options.model;
    this._debuggerService = options.service;
    this._trans = (options.translator ?? nullTranslator).load('jupyterlab');

    this.addClass('jp-DebuggerKernelSources-body');
  }

  render(): JSX.Element {
    let filterClass = FILTERBOX_CLASS;
    if (!this._showFilter) {
      filterClass += ' ' + FILTERBOX_HIDDEN_CLASS;
    }
    return (
      <React.Fragment>
        <div className={filterClass} key={'filter'}>
          <KernelSourcesFilter model={this._model} />
        </div>
        <UseSignal signal={this._model.changed}>
          {(_, kernelSources) => {
            const keymap: { [key: string]: number } = {};
            return (kernelSources ?? []).map(module => {
              const name = module.name;
              const path = module.path;
              const key =
                name + (keymap[name] = (keymap[name] ?? 0) + 1).toString();
              const button = (
                <ToolbarButtonComponent
                  key={key}
                  icon={openKernelSourceIcon}
                  label={name}
                  tooltip={path}
                  onClick={() => {
                    this._debuggerService
                      .getSource({
                        sourceReference: 0,
                        path: path
                      })
                      .then(source => {
                        this._model.open(source);
                      })
                      .catch(reason => {
                        void showErrorMessage(
                          this._trans.__('Fail to get source'),
                          this._trans.__(
                            "Fail to get '%1' source:\n%2",
                            path,
                            reason
                          )
                        );
                      });
                  }}
                />
              );
              return button;
            });
          }}
        </UseSignal>
      </React.Fragment>
    );
  }

  /**
   * Show or hide the filter box.
   */
  public toggleFilterbox(): void {
    this._showFilter = !this._showFilter;
    this.update();
  }

  private _model: IDebugger.Model.IKernelSources;
  private _debuggerService: IDebugger;
  private _trans: TranslationBundle;
  private _showFilter = false;
}

/**
 * A namespace for SourcesBody `statics`.
 */
export namespace KernelSourcesBody {
  /**
   * Instantiation options for `Breakpoints`.
   */
  export interface IOptions {
    /**
     * The debug service.
     */
    service: IDebugger;

    /**
     * The sources model.
     */
    model: IDebugger.Model.IKernelSources;

    /**
     * The application language translator
     */
    translator?: ITranslator;
  }
}