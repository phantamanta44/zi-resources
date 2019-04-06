package xyz.phanta.zi.resources.resource

enum class ResourceForm(private val tagName: String) {

    DUST("dust"),
    INGOT("ingot"),
    NUGGET("nugget"),
    PLATE("plate"),
    GEAR("gear"),

    ORE("ore"),
    BLOCK("storage_block");

    companion object {

        val ITEM_FORMS: Array<ResourceForm> = arrayOf(DUST, INGOT, NUGGET, PLATE, GEAR)
        val NON_VANILLA_FORMS: Array<ResourceForm> = arrayOf(DUST, PLATE, GEAR)

    }

    fun getResourceName(material: ResourceMaterial) = "${tagName}_${material.materialName}"

}
