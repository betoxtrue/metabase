import React, { Component } from "react";
import PropTypes from "prop-types";

import Icon from "metabase/components/Icon";
import { formatQueryDescription } from "metabase-lib/lib/queries/utils/description";
import ObjectActionSelect from "./ObjectActionSelect";

export default class MetricItem extends Component {
  static propTypes = {
    metric: PropTypes.object.isRequired,
    onRetire: PropTypes.func.isRequired,
  };

  render() {
    const { metric, onRetire } = this.props;

    const description = formatQueryDescription(metric.query_description, {
      sections: ["table", "aggregation", "filter"],
      jsx: true,
    });

    return (
      <tr>
        <td className="px1 py1 text-wrap">
          <span className="flex align-center">
            <Icon {...metric.getIcon()} size={12} className="mr1 text-medium" />
            <span className="text-dark text-bold">{metric.name}</span>
          </span>
        </td>
        <td className="px1 py1 text-wrap">{description}</td>
        <td className="px1 py1 text-centered">
          <ObjectActionSelect
            object={metric}
            objectType="metric"
            onRetire={onRetire}
          />
        </td>
      </tr>
    );
  }
}
