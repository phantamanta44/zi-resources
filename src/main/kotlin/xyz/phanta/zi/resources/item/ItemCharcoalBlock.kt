package xyz.phanta.zi.resources.item

import net.minecraft.block.Block
import net.minecraft.item.Item
import net.minecraft.item.ItemBlock
import net.minecraft.item.ItemStack

class ItemCharcoalBlock(block: Block, properties: Item.Properties) : ItemBlock(block, properties) {

    override fun getBurnTime(stack: ItemStack): Int = 16000

}
