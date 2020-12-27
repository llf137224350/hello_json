/*
 * @Author: い 狂奔的蜗牛
 * @Date: 2020-12-11 12:12:15
 * @LastEditTime: 2020-12-11 17:48:21
 * @Description:
 */
import React, {Component} from 'react';

import './app.css';
import 'antd/dist/antd.css';
import interfaceDefinition from "./libs/Interface_definition";
import formatJSON from './libs/format_json_for_open';
import formatJSONForFold from './libs/format_json_for_fold';
import {message} from 'antd';
import Config from './util/config';
import EncryptAndDecrypt from "./util/encrypt_and_decrypt";

const ClipboardJS = require('clipboard');

const jsonStr = `{"rewardable":true,"setting":{"description":"小礼物走一走，来简书关注我","default_amount":200},"total_rewards_count":2,"reward_buyers":[{"avatar":"https://upload.jianshu.io/users/upload_avatars/24980734/6a3c4ca0-a49b-4c04-bd0e-873680f9d299","slug":"7e41f9591579"},{"avatar":"https://cdn2.jianshu.io/assets/default_avatar/2-9636b13945b9ccf345bc98d0d81074eb.jpg","slug":"2b934bfdf859"}]}`;
// 是否创建typescript 接口定义输出
const createInterfaceDefinition = localStorage.getItem(EncryptAndDecrypt.encryptBase64('createinterface_definition')) !== '0';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isToggle: false,
      createInterfaceDefinition: createInterfaceDefinition,
      currentModel: Config.OPEN_MODE, // 1 展开模式 2 折叠模式
      currentExportModel: Config.NOT_EXPORT, // 导出模式  1 don't export 2 export 3 export default
      inputJsonStr: jsonStr, // 待处理字符串
      formatResultForOpen: formatJSON(jsonStr), // 默认解析展开模式
      formatResultForFold: '', // 折叠模式
      interfaceDefinitionResult: createInterfaceDefinition ? interfaceDefinition(jsonStr) : '', // 接口定义
      placeholder: `示例：${jsonStr}`
    }
    this.v1Ref = undefined; // 展开模式
    this.v2Ref = undefined; // 折叠模式
    this.handleChange = this.handleChange.bind(this)
    this.modelChange = this.modelChange.bind(this)
    this.exportModelChange = this.exportModelChange.bind(this)
    this.toggleCreateInterfaceDefinition = this.toggleCreateInterfaceDefinition.bind(this)
    this.getClassName = this.getClassName.bind(this)
  }

  /**
   * 输入框值变化
   * @param e
   */
  handleChange(e) {
    const value = e.target.value;
    // 生成ts 接口定义
    if (this.state.createInterfaceDefinition) {
      this.setState({
        interfaceDefinitionResult: interfaceDefinition(value, this.state.currentExportModel),
      })
    }
    this.setState(() => {
      return {
        inputJsonStr: value,
        formatResultForOpen: '',
        formatResultForFold: '',
      };
    }, () => {
      this.format(this.state.currentModel, value, Config.INPUT_CHANGED);
    });
  }

  /**
   * 格式化处理
   * @param currentModel
   * @param value
   * @param type 1 模式切换 2 输入框值变化
   */
  format(currentModel, value, type) {
    if (type === Config.MODEL_CHANGED) {
      if ((currentModel === Config.OPEN_MODE && this.state.formatResultForOpen) ||
        (currentModel === Config.FOLD_MODE && this.state.formatResultForFold)) { // 来至于模式切换，且是从展开模式切换到折叠模式
        return;
      }
    }
    if (currentModel === Config.OPEN_MODE) { // 展开模式
      this.setState({
        formatResultForOpen: formatJSON(value)
      });
    } else {
      this.setState({
        formatResultForFold: formatJSONForFold(value)
      });
    }
  }

  /**
   * 模式切换
   * @param e
   */
  modelChange(e) {
    const value = e.target.dataset.value * 1;
    if (value === this.state.currentModel) {
      return;
    }
    this.setState(() => {
      return value === Config.FOLD_MODE ? {
        currentModel: value,
        formatResultForOpen: this.v1Ref.innerHTML
      } : {
        currentModel: value,
        formatResultForFold: this.v2Ref.innerHTML
      }
    }, () => {
      this.format(value, this.state.inputJsonStr, Config.MODEL_CHANGED);
    });
  }

  /**
   * 导出模式切换
   * @param e
   */
  exportModelChange(e) {
    const value = e.target.dataset.value * 1;
    this.setState({
      currentExportModel: value,
      interfaceDefinitionResult: interfaceDefinition(this.state.inputJsonStr, value),
    });
  }

  /**
   * 复制成功回调
   * @param e
   */
  copySuccessHandle(e) {
    message.success(`${e.text} 已复制`);
  }

  /**
   * 点击展开或者收拢
   * @param e
   */
  clickArrowHandle(e) {
    const arr = Array.from(e.target.classList);
    if (arr.includes('object') || arr.includes('array')) { // 点击obj
      const {fold, id} = e.target.dataset;
      const value = sessionStorage.getItem(id);
      const indent = sessionStorage.getItem(EncryptAndDecrypt.encryptByDESModeEBC(id + 'indent'));
      e.target.dataset.fold = fold * 1 === Config.OPEN_STATUS ? Config.FOLD_STATUS.toString() : Config.OPEN_STATUS.toString();
      document.getElementById(id).innerHTML = formatJSONForFold(value, fold * 1, indent, arr.includes('object'));
    }
  }

  toggleCreateInterfaceDefinition() {
    this.setState({
      isToggle: true
    });
    if (!this.state.createInterfaceDefinition) {
      this.setState(() => {
        return {interfaceDefinitionResult: interfaceDefinition(this.state.inputJsonStr, this.state.currentExportModel)};
      }, () => {
        this.setState({
          createInterfaceDefinition: !this.state.createInterfaceDefinition
        });
      })
      // 接口定义
    } else {
      this.setState({
        createInterfaceDefinition: !this.state.createInterfaceDefinition
      });
    }
    localStorage.setItem(EncryptAndDecrypt.encryptBase64('createinterface_definition'), !this.state.createInterfaceDefinition ? '1' : '0');
  }

  componentDidMount() {
    const clipboard = new ClipboardJS('.copy');
    clipboard.on('success', this.copySuccessHandle);
    document.addEventListener('click', this.clickArrowHandle);
  }

  getClassName() {
    const {isToggle, createInterfaceDefinition} = this.state;
    if (isToggle) {
      if (createInterfaceDefinition) {
        return 'right-container animate__animated animate__slideInRight';
      } else {
        return 'hidden right-container animate__animated animate__slideOutRight';
      }
    } else {
      if (createInterfaceDefinition) {
        return 'right-container';
      } else {
        return 'hidden right-container';
      }
    }
  }

  render() {
    const {
      placeholder,
      createInterfaceDefinition,
      currentModel,
      formatResultForOpen,
      formatResultForFold,
      currentExportModel,
      interfaceDefinitionResult
    } = this.state;
    return <>
      <div className='app'>
        <div className='left-container'>
          <div className="title iconfont">JSON字符串</div>
          <textarea className='input' placeholder={placeholder}
                    onChange={(e) => {
                      this.handleChange(e);
                    }}/>
        </div>
        <div className={createInterfaceDefinition ? 'middle-container' : 'hidden middle-container'}>
          <div className="tab-list">
            <div className={currentModel === Config.OPEN_MODE ? 'tab-item current' : 'tab-item'}
                 data-value={Config.OPEN_MODE}
                 onClick={this.modelChange}
            >展开模式
            </div>
            <div className={currentModel === Config.FOLD_MODE ? 'tab-item current' : 'tab-item'}
                 data-value={Config.FOLD_MODE}
                 onClick={this.modelChange}
            >折叠模式
            </div>
          </div>
          {
            this.state.currentModel === Config.OPEN_MODE &&
            <div className='content' ref={(el) => {
              this.v1Ref = el;
            }
            } dangerouslySetInnerHTML={{__html: formatResultForOpen}}/>
          }
          {
            this.state.currentModel === Config.FOLD_MODE &&
            <div className='content' ref={(el) => {
              this.v2Ref = el;
            }
            } dangerouslySetInnerHTML={{__html: formatResultForFold}}/>
          }
        </div>
        <div className={this.getClassName()}>
          <div className="tab-list">
            <div className={currentExportModel === Config.NOT_EXPORT ? 'tab-item current' : 'tab-item'}
                 data-value={Config.NOT_EXPORT}
                 onClick={this.exportModelChange}
            >don't export
            </div>
            <div className={currentExportModel === Config.EXPORT ? 'tab-item current' : 'tab-item'}
                 data-value={Config.EXPORT}
                 onClick={this.exportModelChange}
            >export
            </div>
            <div className={currentExportModel === Config.EXPORT_DEFAULT ? 'tab-item current' : 'tab-item'}
                 data-value={Config.EXPORT_DEFAULT}
                 onClick={this.exportModelChange}
            >export default
            </div>
          </div>
          <div className='toggle iconfont' onClick={this.toggleCreateInterfaceDefinition}/>
          <div className='content' dangerouslySetInnerHTML={{__html: interfaceDefinitionResult}}/>
        </div>
      </div>
    </>
  }
}

export default App;
