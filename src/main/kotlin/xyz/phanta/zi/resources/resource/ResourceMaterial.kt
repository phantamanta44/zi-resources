package xyz.phanta.zi.resources.resource

import net.minecraft.item.EnumRarity

enum class ResourceMaterial(val materialName: String, val rarity: EnumRarity = EnumRarity.COMMON) {

    IRON("iron"),
    GOLD("gold"),

    COPPER("copper"),
    TIN("tin"),
    ALUMINIUM("aluminum"),
    SILVER("silver"),
    LEAD("lead"),
    NICKEL("nickel"),
    IRIDIUM("iridium", EnumRarity.UNCOMMON),

    BRONZE("bronze"),
    STEEL("steel"),
    CONSTANTAN("constantan"),
    ELECTRUM("electrum"),
    INVAR("invar");

    companion object {

        val RAW_MATERIALS: Array<ResourceMaterial> = arrayOf(COPPER, TIN, ALUMINIUM, SILVER, LEAD, NICKEL, IRIDIUM)
        val NON_VANILLA_MATERIALS: Array<ResourceMaterial> = arrayOf(
                COPPER, TIN, ALUMINIUM, SILVER, LEAD, NICKEL, IRIDIUM, BRONZE, STEEL, CONSTANTAN, ELECTRUM, INVAR
        )
        val VANILLA_MATERIALS: Array<ResourceMaterial> = arrayOf(IRON, GOLD)

    }

}
