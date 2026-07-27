import { findByProps, findByStoreName, findByTypeNameAll } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import getTag from "../lib/getTag";

const TagModule = findByProps("getBotLabel");
const GuildStore = findByStoreName("GuildStore");

const rowPatch = ([{ guildId, user }], res) => {
    const label = res?.props?.label;
    const nameContainer = findInReactTree(
        label,
        (c) =>
            Array.isArray(c?.props?.children) &&
            c.props.children.some(
                (ch) => typeof ch === "string" || typeof ch?.props?.children === "string"
            )
    );

    const existingTag = findInReactTree(nameContainer, (c) => c?.type?.Types);
    if (existingTag && existingTag.props?.type !== 0) return;

    const guild = GuildStore.getGuild(guildId);
    const tag = getTag(guild, undefined, user);

    if (tag) {
        if (existingTag) {
            Object.assign(existingTag.props, {
                type: 0,
                text: tag.text,
                textColor: tag.textColor,
                backgroundColor: tag.backgroundColor,
                verified: tag.verified,
            });
        } else {
            if (!Array.isArray(nameContainer.props.children)) {
                nameContainer.props.children = [nameContainer.props.children];
            }
            nameContainer.props.children.push(
                <TagModule.default
                    type={0}
                    text={tag.text}
                    textColor={tag.textColor}
                    backgroundColor={tag.backgroundColor}
                    verified={tag.verified}
                />
            );
        }
    }
};

export default () => {
    const patches = []

    findByTypeNameAll("UserRow").forEach((UserRow) => patches.push(after("type", UserRow, rowPatch)))

    return () => patches.forEach((unpatch) => unpatch())
}