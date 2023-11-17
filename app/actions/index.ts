import COURSE_ACTIONS from "./course";
import MARKETING_ACTIONS from "./marketing";
import BUSINESS_ACTIONS from "./business";
import BLOG_ACTIONS from "./blog";
import PRODUCT_ACTIONS from "./product";
import MESSAGING_ACTIONS from "./messaging";
import NEWSLETTER_ACTIONS from "./newsletter";
import WRITING_ACTIONS from "./grammer";
export default {
  ...COURSE_ACTIONS,
  ...MARKETING_ACTIONS,
  ...BUSINESS_ACTIONS,
  ...BLOG_ACTIONS,
  // ...PRODUCT_ACTIONS,
  ...MESSAGING_ACTIONS,
  ...NEWSLETTER_ACTIONS,
  ...WRITING_ACTIONS,
};
