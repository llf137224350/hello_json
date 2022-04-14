import React, { Component } from "react";
import "./index.css";

export default class NavBar extends Component {
  getClassName() {
    let className = "nav-bar-item toggle iconfont";
    if (!this.props.open) {
      className += " close";
    }
    return className;
  }
  render() {
    return (
      <div className="nav-bar">
        <div
          onClick={this.props.onToggle}
          className={this.getClassName()}
          title="收起/展开面板"
        />
        <div className="nav-bar-item iconfont code">
          <div className="content">
            <div className="tip">
              由于部署当前工具需要购买服务器和域名，对于个人开发者来说，并不是件轻松的事情。如果您觉得该工具好用，条件允许的情况下，可以试着赞助一下。谢谢！
            </div>
            <div className="tip">联系开发者，微信号：llf137224350</div>
            <img
              className="collection-code"
              src="https://hsh.cyzl.com/file-server/g001/M00/01/90/oYYBAGJXiZCAdDCdAAN2ScI5dfM259.jpg"
              alt=""
            />
            <div className="tip">
              赞助列表（微信昵称）：strive
            </div>
          </div>
        </div>
        <div
          className="nav-bar-item iconfont star"
          title="赏颗star~"
          onClick={function () {
            window.open("https://github.com/llf137224350/hello_json");
          }}
        />
      </div>
    );
  }
}
