import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import getTag, { BUILT_IN_TAGS } from "../lib/getTag";

const DisplayName = findByName("DisplayName", false);
const HeaderName = findByName("HeaderName", false);
const TagModule = findByProps("getBotLabel");
const getBotLabel = TagModule?.getBotLabel;
const GuildStore = findByStoreName("GuildStore");
const ChannelStore = findByStoreName("ChannelStore");

export default () => {
    const patches = [];

    if (HeaderName) {
        patches.push(after("default", HeaderName, ([{ channelId }], ret) => {
            ret.props.channelId = channelId;
        }));
    }

    if (DisplayName) {
        patches.push(after("default", DisplayName, ([{ guildId, channelId, user }], ret) => {
            const tagComponent = findInReactTree(ret, (c) => c.type?.Types);
            if (!tagComponent || !BUILT_IN_TAGS.includes(getBotLabel?.(tagComponent.props.type))) {
                const guild = GuildStore.getGuild(guildId);
                const channel = ChannelStore.getChannel(channelId);
                const tag = getTag(guild, channel, user);
                if (tag) {
                    if (tagComponent) {
                        tagComponent.props = {
                            type: 0,
                            ...tag
                        };
                    } else {
                        const row = findInReactTree(ret, (c) => c.props?.style?.flexDirection === "row");
                        row?.props.children.push(
                            <TagModule.default
                                style={{ marginLeft: 0 }}
                                type={0}
                                text={tag.text}
                                textColor={tag.textColor}
                                backgroundColor={tag.backgroundColor}
                                verified={tag.verified}
                            />
                        );
                    }
                }
            }
        }));
    }

    return () => patches.forEach(unpatch => unpatch());
};