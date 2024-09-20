import { Action } from "../state/types";
import COURSE_ACTIONS from "../actions/course";
import MARKETING_ACTIONS from "../actions/marketing";
import BUSINESS_ACTIONS from "../actions/business";
import BLOG_ACTIONS from "../actions/blog";
import GRAMMER_ACTIONS from "../actions/grammer";
import PRODUCT_ACTIONS from "../actions/product";
import NEWSLETTER_ACTIONS from "../actions/newsletter";

type Actions = {
  [key: string]: {
    [key: string]: Action;
  };
};

const ACTIONS: Actions = {
  business: BUSINESS_ACTIONS,
  blog: BLOG_ACTIONS,
  writing: GRAMMER_ACTIONS,
  product: PRODUCT_ACTIONS,
  course: COURSE_ACTIONS,
  marketing: MARKETING_ACTIONS,
  newsletter: NEWSLETTER_ACTIONS,
};

export const ACTION_ICONS: { [key: string]: string } = {
  business: "💼",
  blog: "📝",
  writing: "✏️",
  product: "📦",
  course: "📚",
  marketing: "📈",
  messaging: "💬",
  newsletter: "📨",
};

export default ACTIONS;
