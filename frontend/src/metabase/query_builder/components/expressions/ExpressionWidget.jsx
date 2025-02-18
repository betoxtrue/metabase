import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { t } from "ttag";
import _ from "underscore";

import MetabaseSettings from "metabase/lib/settings";

import ExternalLink from "metabase/core/components/ExternalLink";
import { isExpression } from "metabase-lib/lib/expressions";
import ExpressionEditorTextfield from "./ExpressionEditorTextfield";

// TODO: combine with ExpressionPopover
export default class ExpressionWidget extends Component {
  static propTypes = {
    expression: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.array,
    ]),
    name: PropTypes.string,
    query: PropTypes.object.isRequired,
    onChangeExpression: PropTypes.func.isRequired,
    onRemoveExpression: PropTypes.func,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    expression: null,
    name: "",
  };

  helpTextTarget = React.createRef();

  UNSAFE_componentWillMount() {
    this.UNSAFE_componentWillReceiveProps(this.props);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (!this.state || !_.isEqual(this.props.expression, newProps.expression)) {
      this.setState({
        name: newProps.name,
        expression: newProps.expression,
      });
    }
  }

  isValid() {
    const { name, expression, error } = this.state;
    return !!name && !error && isExpression(expression);
  }

  handleCommit = () => {
    this.props.onChangeExpression(this.state.name, this.state.expression);
    this.props.onClose();
  };

  render() {
    const { query } = this.props;
    const { expression, name } = this.state;

    return (
      <div style={{ maxWidth: "600px" }}>
        <div className="p2">
          <div className="h5 text-uppercase text-medium text-bold">{t`Field formula`}</div>
          <div ref={this.helpTextTarget}>
            <ExpressionEditorTextfield
              helpTextTarget={this.helpTextTarget.current}
              expression={expression}
              name={name}
              query={query}
              onChange={parsedExpression =>
                this.setState({ expression: parsedExpression, error: null })
              }
              onError={errorMessage => this.setState({ error: errorMessage })}
            />
            <p className="h5 text-medium">
              {t`Think of this as being kind of like writing a formula in a spreadsheet program: you can use numbers, fields in this table, mathematical symbols like +, and some functions. So you could type something like Subtotal - Cost.`}
              &nbsp;
              <ExternalLink
                className="link"
                target="_blank"
                href={MetabaseSettings.docsUrl(
                  "questions/query-builder/expressions",
                )}
              >{t`Learn more`}</ExternalLink>
            </p>
          </div>

          <div className="mt3 h5 text-uppercase text-medium text-bold">{t`Give it a name`}</div>
          <div>
            <input
              className="my1 input block full"
              type="text"
              value={this.state.name}
              placeholder={t`Something nice and descriptive`}
              onChange={event => this.setState({ name: event.target.value })}
              onKeyPress={e => {
                if (e.key === "Enter" && this.isValid()) {
                  this.handleCommit();
                }
              }}
            />
          </div>
        </div>

        <div className="mt2 p2 border-top flex flex-row align-center justify-between">
          <div className="ml-auto">
            <button
              className="Button"
              onClick={() => this.props.onClose()}
            >{t`Cancel`}</button>
            <button
              className={cx("Button ml2", {
                "Button--primary": this.isValid(),
              })}
              onClick={() => {
                this.props.onChangeExpression(
                  this.state.name,
                  this.state.expression,
                );
                this.props.onClose();
              }}
              disabled={!this.isValid()}
            >
              {this.props.expression ? t`Update` : t`Done`}
            </button>
          </div>
          <div>
            {this.props.expression && this.props.onRemoveExpression ? (
              <a
                className="pr2 ml2 text-error link"
                onClick={() => {
                  this.props.onRemoveExpression(this.props.name);
                  this.props.onClose();
                }}
              >{t`Remove`}</a>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
