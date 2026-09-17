from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


class PullQuoteBlock(blocks.StructBlock):
    quote = blocks.CharBlock(required=True)
    attribution = blocks.CharBlock(required=False)

    class Meta:
        icon = "openquote"
        template = "content/blocks/pull_quote.html"


class BodyStreamBlock(blocks.StreamBlock):
    paragraph = blocks.RichTextBlock(features=["bold", "italic", "link", "ol", "ul"])
    image = ImageChooserBlock()
    quote = PullQuoteBlock()
