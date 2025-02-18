import { tag_names } from "cljs/metabase.shared.parameters.parameters";
import { isActionCard } from "metabase/writeback/utils";
import Question from "metabase-lib/lib/Question";
import { ExpressionDimension } from "metabase-lib/lib/Dimension";
import {
  dimensionFilterForParameter,
  getTagOperatorFilterForParameter,
  variableFilterForParameter,
} from "metabase-lib/lib/parameters/utils/filters";
import {
  buildDimensionTarget,
  buildTemplateTagVariableTarget,
  buildTextTagTarget,
} from "metabase-lib/lib/parameters/utils/targets";

function buildStructuredQuerySectionOptions(section) {
  return section.items.map(({ dimension }) => ({
    sectionName: section.name,
    name: dimension.displayName(),
    icon: dimension.icon(),
    target: buildDimensionTarget(dimension),
    // these methods don't exist on instances of ExpressionDimension
    isForeign: !!(dimension instanceof ExpressionDimension
      ? false
      : dimension.fk() || dimension.joinAlias()),
  }));
}

function buildNativeQuerySectionOptions(section) {
  return section.items.map(({ dimension }) => ({
    name: dimension.displayName(),
    icon: dimension.icon(),
    isForeign: false,
    target: buildDimensionTarget(dimension),
  }));
}

function buildVariableOption(variable) {
  return {
    name: variable.displayName(),
    icon: variable.icon(),
    isForeign: false,
    target: buildTemplateTagVariableTarget(variable),
  };
}

function buildTextTagOption(tagName) {
  return {
    name: tagName,
    icon: "string",
    isForeign: false,
    target: buildTextTagTarget(tagName),
  };
}

export function getParameterMappingOptions(
  metadata,
  parameter = null,
  card,
  dashcard = null,
) {
  if (dashcard && card.display === "text") {
    const tagNames = tag_names(dashcard.visualization_settings.text || "");
    return tagNames ? tagNames.map(buildTextTagOption) : [];
  }

  if (isActionCard(card)) {
    // Action parameters are mapped via click behavior UI for now
    return [];
  }

  if (!card.dataset_query) {
    return [];
  }

  const question = new Question(card, metadata);
  const query = question.query();
  const options = [];
  if (question.isDataset()) {
    // treat the dataset/model question like it is already composed so that we can apply
    // dataset/model-specific metadata to the underlying dimension options
    const composedDatasetQuery = question.composeDataset().query();
    options.push(
      ...composedDatasetQuery
        .dimensionOptions(
          parameter ? dimensionFilterForParameter(parameter) : undefined,
        )
        .sections()
        .flatMap(section => buildStructuredQuerySectionOptions(section)),
    );
  } else if (question.isStructured()) {
    options.push(
      ...query
        .dimensionOptions(
          parameter ? dimensionFilterForParameter(parameter) : undefined,
        )
        .sections()
        .flatMap(section => buildStructuredQuerySectionOptions(section)),
    );
  } else {
    options.push(
      ...query
        .variables(
          parameter ? variableFilterForParameter(parameter) : undefined,
        )
        .map(buildVariableOption),
    );
    options.push(
      ...query
        .dimensionOptions(
          parameter ? dimensionFilterForParameter(parameter) : undefined,
          parameter ? getTagOperatorFilterForParameter(parameter) : undefined,
        )
        .sections()
        .flatMap(section => buildNativeQuerySectionOptions(section)),
    );
  }

  return options;
}
