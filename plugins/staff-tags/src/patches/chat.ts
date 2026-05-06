import { findByName, findByStoreName } from "@vendetta/metro";
import { ReactNative, chroma } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import getTag, { BUILT_IN_TAGS } from "../lib/getTag";

const getTagProperties = findByName("getTagProperties", false);
const GuildStore = findByStoreName("GuildStore");
const ChannelStore = findByStoreName("ChannelStore");

export default () => {
    if (!getTagProperties) return () => {};
    return after("default", getTagProperties, ([{ message }], ret) => {
        if (!BUILT_IN_TAGS.includes(ret.tagText)) {
            const channel = ChannelStore.getChannel(message.channel_id);
            const guild = GuildStore.getGuild(channel?.guild_id);
            const tag = getTag(guild, channel, message.author);
            if (tag) {
                return {
                    ...ret,
                    tagText: tag.text,
                    tagTextColor: tag.textColor ? ReactNative.processColor(chroma(tag.textColor).hex()) : undefined,
                    tagBackgroundColor: tag.backgroundColor ? ReactNative.processColor(chroma(tag.backgroundColor).hex()) : undefined,
                    tagVerified: tag.verified,
                    tagType: undefined
                };
            }
        }
    });
};