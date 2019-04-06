package xyz.phanta.zi.resources.init

import net.minecraft.block.Block
import net.minecraft.block.material.Material
import net.minecraft.item.Item
import net.minecraft.item.ItemGroup
import net.minecraft.item.ItemStack
import net.minecraft.tags.ItemTags
import net.minecraft.util.ResourceLocation
import net.minecraftforge.registries.ForgeRegistries
import xyz.phanta.libnine.definition.DefBody
import xyz.phanta.libnine.definition.Definer
import xyz.phanta.libnine.definition.DefinitionDefContext
import xyz.phanta.zi.resources.ZirMod
import xyz.phanta.zi.resources.item.ItemCharcoalBlock
import xyz.phanta.zi.resources.resource.ResourceForm
import xyz.phanta.zi.resources.resource.ResourceMaterial

object ZirCommonInit : Definer {

    private lateinit var tabZir: ItemGroup

    override fun definitions(): DefBody<DefinitionDefContext> = {
        itemGroup(::tabZir) { ItemStack { ForgeRegistries.ITEMS.getValue(ZirMod.resource("ingot_silver"))!! } }

        itemsBy({ it.withGroup(tabZir) }) {
            itemsAug(::Item) {
                ResourceMaterial.NON_VANILLA_MATERIALS.forEach { material ->
                    ResourceForm.ITEM_FORMS.forEach { form ->
                        item(form.getResourceName(material)) { it.withRarity(material.rarity).build() }
                    }
                }
                ResourceMaterial.VANILLA_MATERIALS.forEach { material ->
                    ResourceForm.NON_VANILLA_FORMS.forEach { form ->
                        item(form.getResourceName(material)) { it.withRarity(material.rarity).build() }
                    }
                }
                item("charcoal_dust")
                item("coal_dust")
                item("obsidian_dust")
                item("sawdust")
            }
        }

        blocksBy({ it.primeItem { item -> item.withGroup(tabZir) } }) {
            blocksAug(::Block, Material.ROCK, primer = { it.withStrength(3F, 3F) }) {
                ResourceMaterial.RAW_MATERIALS.forEach { material ->
                    block(ResourceForm.ORE.getResourceName(material)) {
                        it.primeItem { item -> item.withRarity(material.rarity) }.build()
                    }
                }
            }
            blocksAug(::Block, Material.IRON, primer = { it.withStrength(4.5F, 6F) }) {
                ResourceMaterial.NON_VANILLA_MATERIALS.forEach { material ->
                    block(ResourceForm.BLOCK.getResourceName(material)) {
                        it.primeItem { item -> item.withRarity(material.rarity) }.build()
                    }
                }
            }
            block("charcoal_block", ::Block, Material.ROCK, itemBlockFactory = ::ItemCharcoalBlock)
        }

    }

}
